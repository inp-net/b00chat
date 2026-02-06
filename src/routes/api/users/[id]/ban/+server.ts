import { banUser, censorMessage, DB } from "$lib/server/database";
import { broadcastMessage, socketSessions } from "$lib/server/socketSessions";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, locals }) => {
    const { id } = params;

    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    if (!DB.User[locals.user.uid]?.moderator) {
        return new Response('Forbidden', { status: 403 });
    }

    // Also censor all their previous messages.
    for (const message of Object.values(DB.Message)) {
        if (message.sender === id && !message.censoredBy) {
            censorMessage(message.id, locals.user.uid);
            broadcastMessage({ type: "message:censored", content: message.id});
        }
    }

    banUser(id);

    // Close any active WebSocket connections for the banned user.
    socketSessions.forEach(({ userUid, peer }) => {
        if (userUid === id && peer) {
            peer.close();
        }
    });

    return new Response(null, { status: 204 });
}