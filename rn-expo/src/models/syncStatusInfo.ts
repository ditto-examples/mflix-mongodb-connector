export class SyncStatusInfo {
    id: string;
    isDittoServer: boolean;
    syncSessionStatus: string;
    syncedUpToLocalCommitId: number | null;
    lastUpdateReceivedTime: number | null;

    constructor(data: any) {
        this.id = data._id || data.id || '';
        this.isDittoServer = data.is_ditto_server || false;
        
        if (data.documents) {
            this.syncSessionStatus = data.documents.sync_session_status || 'Unknown';
            this.syncedUpToLocalCommitId = data.documents.synced_up_to_local_commit_id || null;
            this.lastUpdateReceivedTime = data.documents.last_update_received_time || null;
        } else {
            this.syncSessionStatus = 'Unknown';
            this.syncedUpToLocalCommitId = null;
            this.lastUpdateReceivedTime = null;
        }
    }

    static fromJson(json: any): SyncStatusInfo {
        return new SyncStatusInfo(json);
    }

    get formattedLastUpdate(): string {
        if (!this.lastUpdateReceivedTime) {
            return 'Never';
        }
        
        // lastUpdateReceivedTime is already in milliseconds, use it directly
        const date = new Date(this.lastUpdateReceivedTime);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        
        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', options)}`;
        }
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', options)}`;
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    get statusColor(): string {
        switch (this.syncSessionStatus) {
            case 'Connected':
                return '#32d74b';  // Green
            case 'Connecting':
                return '#ff9500';  // Orange
            case 'Disconnected':
            case 'Not Connected':
                return '#ff3b30';  // Red
            default:
                return '#8e8e93';  // Gray
        }
    }

    get peerType(): string {
        return this.isDittoServer ? 'Cloud Server' : 'Peer Device';
    }

    get formattedCommitId(): string {
        if (this.syncedUpToLocalCommitId === null) {
            return 'Not synced';
        }
        return `Synced to local database commit: ${this.syncedUpToLocalCommitId}`;
    }
}