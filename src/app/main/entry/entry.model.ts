/**
 * Created by Rami Khadder on 8/7/2017.
 */
export class Entry {
    employeeName: string;
    employeeId: number;
    clientName: string;
    clientId: number;
    projectName: string;
    projectId: number;
    weekOf: string;

    constructor(employeeName: string, employeeId: number, clientName: string, clientId: number,
                projectName: string, projectId: number, weekOf: string) {
        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.clientName = clientName;
        this.clientId = clientId;
        this.projectName = projectName;
        this.projectId = projectId;
        this.weekOf = weekOf;
    }
}
