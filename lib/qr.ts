export type EventPayload = {
  v: number;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

export function parseQRPayload(
  rawPayload: string
): EventPayload | null {
  try {
    const payload = JSON.parse(rawPayload);

    if (
      !payload ||
      payload.v !== 1 ||
      typeof payload.event !== 'string' ||
      !payload.event
    ) {
      return null;
    }

    return {
      v: payload.v,
      event: payload.event,
      title:
        typeof payload.title === 'string'
          ? payload.title
          : undefined,
      start:
        typeof payload.start === 'string'
          ? payload.start
          : undefined,
      end:
        typeof payload.end === 'string'
          ? payload.end
          : undefined,
    };
  } catch {
    return null;
  }
}