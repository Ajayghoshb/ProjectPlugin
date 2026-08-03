export class MeetingUtilities {
  public static formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  public static isOrganizer(role?: string): boolean {
    return role?.toLowerCase() === 'organizer';
  }
}
