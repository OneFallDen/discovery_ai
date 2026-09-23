type Socket = Pick<WebSocket, "close" | "onopen" | "onmessage" | "onclose" | "onerror">;

interface GenerationSocketOptions {
    create: () => Socket;
    onOpen: () => void;
    onMessage: (data: string) => void;
    schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
    cancel?: (timer: ReturnType<typeof setTimeout>) => void;
}

export function connectGenerationSocket({
    create,
    onOpen,
    onMessage,
    schedule = setTimeout,
    cancel = clearTimeout,
}: GenerationSocketOptions): () => void {
    let stopped = false;
    let socket: Socket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let delay = 1000;

    const connect = () => {
        if (stopped) return;
        const current = create();
        socket = current;
        current.onopen = () => {
            delay = 1000;
            onOpen();
        };
        current.onmessage = (event) => onMessage(String(event.data));
        current.onclose = () => {
            if (stopped || socket !== current) return;
            timer = schedule(connect, delay);
            delay = Math.min(delay * 2, 30000);
        };
        current.onerror = () => current.close();
    };

    connect();
    return () => {
        stopped = true;
        if (timer) cancel(timer);
        socket?.close();
    };
}
