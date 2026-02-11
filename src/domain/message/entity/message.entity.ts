import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { MessageStatus } from '../enum/message-status.enum';

/**
 * Message Entity - Core Domain
 *
 * @description
 * Represents a message in the system with all business rules encapsulated.
 * This entity is framework-agnostic and contains pure business logic.
 */
export class Message {
  constructor(
    public readonly id: string,
    public readonly sender: string,
    public readonly content: string,
    public readonly createdAt: number,
    private _status: MessageStatus,
    private _updatedAt: number,
    public readonly entity: string = 'MESSAGE',
  ) {
    this.validate();
  }

  get status(): MessageStatus {
    return this._status;
  }

  get updatedAt(): number {
    return this._updatedAt;
  }

  /**
   * Validates message data
   *
   * @throws {InternalServerErrorException} When message data is invalid
   */
  private validate(): void {
    if (!this.content?.trim()) {
      throw new InternalServerErrorException('Message content cannot be empty');
    }

    if (!this.sender?.trim()) {
      throw new InternalServerErrorException('Message sender is required');
    }

    if (!this.id?.trim()) {
      throw new InternalServerErrorException('Message ID is required');
    }
  }

  /**
   * Updates message status following business rules
   *
   * @param newStatus - The new status to transition to
   * @throws {ConflictException} When transition is not allowed
   */
  updateStatus(newStatus: MessageStatus): void {
    const validTransitions: Record<MessageStatus, MessageStatus[]> = {
      [MessageStatus.SENT]: [MessageStatus.DELIVERED, MessageStatus.READ],
      [MessageStatus.DELIVERED]: [MessageStatus.READ],
      [MessageStatus.READ]: [],
    };

    const allowedTransitions = validTransitions[this._status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ConflictException(
        `Cannot transition from ${this._status} to ${newStatus}`,
      );
    }

    this._status = newStatus;
    this._updatedAt = Date.now();
  }

  /**
   * Checks if message has been read
   */
  isRead(): boolean {
    return this._status === MessageStatus.READ;
  }

  /**
   * Checks if message has been delivered
   */
  isDelivered(): boolean {
    return (
      this._status === MessageStatus.DELIVERED ||
      this._status === MessageStatus.READ
    );
  }

  /**
   * Factory method to create a new message
   *
   * @param id - Unique identifier
   * @param sender - Username of the sender
   * @param content - Message content
   * @returns A new Message instance
   */
  static create(id: string, sender: string, content: string): Message {
    const now = Date.now();
    return new Message(
      id,
      sender,
      content,
      now,
      MessageStatus.SENT,
      now,
      'MESSAGE',
    );
  }

  /**
   * Converts entity to plain object for persistence
   */
  toObject(): {
    id: string;
    sender: string;
    content: string;
    status: MessageStatus;
    createdAt: number;
    updatedAt: number;
    entity: string;
  } {
    return {
      id: this.id,
      sender: this.sender,
      content: this.content,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
      entity: this.entity,
    };
  }
}
