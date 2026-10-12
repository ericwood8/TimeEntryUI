/** A request status as the server lists it (GET api/requests/statuses): its id, its name and the ids it can move to. */
export interface RequestStatus {
    id: number;
    name: string;
    next: number[];
}
