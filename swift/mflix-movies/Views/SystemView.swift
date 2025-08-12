import SwiftUI

struct SystemView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedTab = 0
    @State private var lastRefresh = Date()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Segmented Control
                Picker("System View", selection: $selectedTab) {
                    Text("Sync Status").tag(0)
                    Text("Indexes").tag(1)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // Tab Content
                if selectedTab == 0 {
                    SyncStatusView()
                } else {
                    IndexesView()
                }
            }
            .navigationTitle("System")
        }
    }
}

struct SyncStatusView: View {
    @Environment(AppState.self) private var appState
    @State private var lastRefresh = Date()
    
    var body: some View {
        Group {
            if appState.syncStatusInfos.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "arrow.trianglehead.2.clockwise.rotate.90.circle")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    Text("No sync information available")
                        .font(.title2)
                        .foregroundColor(.secondary)
                    Text("Make sure sync is active and peers are connected")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                List {
                    Section(header: syncStatusHeader) {
                        ForEach(appState.syncStatusInfos) { syncInfo in
                            SyncStatusRowView(syncInfo: syncInfo)
                        }
                    }
                }
                .listStyle(.plain)
                #if os(iOS)
                .listSectionSpacing(.compact)
                #endif
            }
        }
    }
    
    private var syncStatusHeader: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Connected Peers")
                .font(.headline)
            Text("Last updated: \(DateFormatter.syncStatusTime.string(from: lastRefresh))")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .onChange(of: appState.syncStatusInfos) {
            lastRefresh = Date()
        }
    }
}

struct IndexesView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        Group {
            if appState.indexes.isEmpty {
                VStack(spacing: 20) {
                    Image(systemName: "list.bullet.rectangle")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    Text("No indexes available")
                        .font(.title2)
                        .foregroundColor(.secondary)
                    Text("Indexes will appear here when created")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                List {
                    Section(header: Text("Local Database Indexes").font(.headline)) {
                        ForEach(appState.indexes) { indexInfo in
                            IndexRowView(indexInfo: indexInfo)
                        }
                    }
                }
                .listStyle(.plain)
                #if os(iOS)
                .listSectionSpacing(.compact)
                #endif
            }
        }
    }
}

struct IndexRowView: View {
    let indexInfo: IndexInfo
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(indexInfo.id)
                        .font(.headline)
                    Text("Collection: \(indexInfo.collection)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "list.bullet.below.rectangle")
                    .foregroundColor(.blue)
                    .font(.title2)
            }
            
            if !indexInfo.fields.isEmpty {
                Divider()
                
                HStack {
                    Image(systemName: "tag")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("Fields: \(indexInfo.formattedFields)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct SyncStatusRowView: View {
    let syncInfo: SyncStatusInfo
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(syncInfo.peerType)
                        .font(.headline)
                    Text(syncInfo.id)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(5)
                        .truncationMode(.middle)
                }
                
                Spacer()
                
                HStack(spacing: 8) {
                    StatusIndicator(status: syncInfo.syncSessionStatus, color: syncInfo.statusColor)
                    Text(syncInfo.syncSessionStatus)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(colorForStatus(syncInfo.statusColor))
                }
            }
            
            Divider()
            
            VStack(alignment: .leading, spacing: 6) {
                if let commitId = syncInfo.syncedUpToLocalCommitId {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                            .font(.caption)
                        Text("Synced to commit: \(NumberFormatter.commitId.string(from: NSNumber(value: commitId)) ?? "\(commitId)")")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                HStack {
                    Image(systemName: "clock")
                        .foregroundColor(.blue)
                        .font(.caption)
                    Text("Last update: \(syncInfo.formattedLastUpdate)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func colorForStatus(_ status: String) -> Color {
        switch status {
        case "green":
            return .green
        case "orange":
            return .orange
        case "red":
            return .red
        default:
            return .gray
        }
    }
    
}

struct StatusIndicator: View {
    let status: String
    let color: String
    
    var body: some View {
        Circle()
            .fill(fillColor)
            .frame(width: 12, height: 12)
            .overlay(
                Circle()
                    .stroke(strokeColor, lineWidth: 1)
            )
    }
    
    private var fillColor: Color {
        switch color {
        case "green":
            return .green
        case "orange":
            return .orange
        case "red":
            return .red
        default:
            return .gray
        }
    }
    
    private var strokeColor: Color {
        fillColor.opacity(0.3)
    }
}

extension DateFormatter {
    static let syncStatusTime: DateFormatter = {
        let formatter = DateFormatter()
        formatter.timeStyle = .medium
        formatter.dateStyle = .none
        return formatter
    }()
}

extension NumberFormatter {
    static let commitId: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .none
        formatter.usesGroupingSeparator = false
        return formatter
    }()
}

#Preview {
    NavigationStack {
        SystemView()
    }
}
