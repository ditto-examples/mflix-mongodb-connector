export class Comment {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public movieId: string,
    public text: string,
    public date: Date
  ) {}

  static fromJson(json: any): Comment {
    return new Comment(
      this.extractId(json._id),
      json.name || '',
      json.email || '',
      this.extractId(json.movie_id),
      json.text || '',
      this.parseDate(json.date)
    );
  }

  private static extractId(id: IdType): string {
    if (typeof id === 'string') return id;
    if (id && typeof id === 'object' && (id as { $oid?: string }).$oid) {
      return (id as { $oid: string }).$oid;
    }
    return id?.toString() || '';
  }

  private static parseDate(date: any): Date {
    if (typeof date === 'string') {
      return new Date(date);
    }
    if (date && typeof date === 'object' && date.$date) {
      const dateInfo = date.$date;
      if (dateInfo && typeof dateInfo === 'object' && dateInfo.$numberLong) {
        const timestamp = parseInt(dateInfo.$numberLong) || 0;
        return new Date(timestamp);
      }
    }
    if (typeof date === 'number') {
      return new Date(date);
    }
    return new Date();
  }

  get displayName(): string {
    return this.name || 'Anonymous';
  }

  get formattedDate(): string {
    const now = new Date();
    const difference = now.getTime() - this.date.getTime();
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  get displayText(): string {
    return this.text;
  }

  get hasValidMovieId(): boolean {
    return this.movieId.length > 0;
  }

  toJson(): any {
    return {
      _id: this.id,
      name: this.name,
      email: this.email,
      movie_id: this.movieId,
      text: this.text,
      date: this.date.getTime(),
    };
  }
}