import { createAdminClient } from '@/lib/supabase/admin';

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function deleteAuthUsersByIds(authUserIds: Array<string | null | undefined>) {
    const ids = Array.from(
        new Set(
            authUserIds
                .map((id) => String(id || '').trim())
                .filter((id) => id.length > 0 && isUuid(id))
        )
    );

    if (ids.length === 0) {
        return { failedIds: [] as string[] };
    }

    const adminClient = createAdminClient();
    const failedIds: string[] = [];

    for (const authUserId of ids) {
        const { error } = await adminClient.auth.admin.deleteUser(authUserId);
        if (!error) continue;

        const isNotFound =
            /not found/i.test(error.message) ||
            /user.*does not exist/i.test(error.message);

        if (!isNotFound) {
            failedIds.push(authUserId);
        }
    }

    return { failedIds };
}
