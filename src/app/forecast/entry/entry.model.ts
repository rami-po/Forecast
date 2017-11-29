/**
 * Created by Rami Khadder on 8/7/2017.
 */
export class Entry {
    firstName: string;
    lastName: string;
    employeeId: number;
    clientName: string;
    clientId: number;
    projectName: string;
    projectId: number;
    weekOf: string;
    capacity: number;

    constructor(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
                projectName: string, projectId: number, weekOf: string, capacity: number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeId = employeeId;
        this.clientName = clientName;
        this.clientId = clientId;
        this.projectName = projectName;
        this.projectId = projectId;
        this.weekOf = weekOf;
        this.capacity = capacity;
    }
}
