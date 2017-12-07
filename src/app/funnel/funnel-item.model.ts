/**
 * Created by Rami Khadder on 10/23/2017.
 */

export class Funnel {
  clientName: string;
  newClient: boolean;
  projectName: string;
  projectManager: string;
  estimatedRevenue: number;
  confidence: number;
  status: string;
  estimatedSigningDate: Date;
  projectedStartDate: Date;
  projectDuration: number;
  scalaProjectId: number;
  isCompleted: boolean;
  notes: string;
  URL: string;
  priority: string;

  constructor(clientName: string, newClient: boolean, projectName: string, projectManager: string,
              estimatedRevenue: number, confidence: number, status: string, estimatedSigningDate: Date,
              projectedStartDate: Date, projectDuration: number, scalaProjectId: number,
              isCompleted: boolean, notes: string, URL: string, priority: string) {
    this.clientName = clientName;
    this.newClient = newClient;
    this.projectName = projectName;
    this.projectManager = projectManager;
    this.estimatedRevenue = estimatedRevenue;
    this.confidence = confidence;
    this.status = status;
    this.estimatedSigningDate = estimatedSigningDate;
    this.projectedStartDate = projectedStartDate;
    this.projectDuration = projectDuration;
    this.scalaProjectId = scalaProjectId;
    this.isCompleted = isCompleted;
    this.notes = notes;
    this.URL = URL;
    this.priority = priority;
  }

}
