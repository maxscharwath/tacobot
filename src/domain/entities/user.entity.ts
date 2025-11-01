/**
 * User domain entity
 * @module domain/entities/user
 */

/**
 * User domain entity
 * Represents a user in the system
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly slackId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Check if user has Slack integration
   */
  hasSlackIntegration(): boolean {
    return !!this.slackId;
  }
}
