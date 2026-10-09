import { HttpErrorResponse } from '@angular/common/http';

/**
 * The message to show for a failed call: what the API said (an RFC 9457 problem has a "detail", and a validation problem
 * lists "errors" by field), or the given fallback when the API said nothing useful.
 */
export function apiMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error?.error;
    if (body && typeof body === 'object') {
        const fieldErrors = body.errors ? (Object.values(body.errors) as string[][]).flat() : [];
        if (fieldErrors.length > 0) {
            return fieldErrors.join('\n');
        }
        if (typeof body.detail === 'string' && body.detail.length > 0) {
            return body.detail;
        }
    }
    return fallback;
}
