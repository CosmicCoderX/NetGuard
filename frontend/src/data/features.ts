export type FeatureGroup =
    | "Flow Information"
    | "Packet Statistics"
    | "Forward Traffic"
    | "Backward Traffic"
    | "Flags & Headers"
    | "Timing & Activity"


export interface NetworkFeature {
    name: string
    label: string
    group: FeatureGroup
    description: string
}


export const networkFeatures: NetworkFeature[] = [

    // ─────────────────────────────────────────
    // Flow Information
    // ─────────────────────────────────────────

    {
        name: "Destination Port",
        label: "Destination Port",
        group: "Flow Information",
        description: "Destination network port.",
    },
    {
        name: "Flow Duration",
        label: "Flow Duration",
        group: "Flow Information",
        description: "Duration of the network flow.",
    },
    {
        name: "Total Fwd Packets",
        label: "Total Forward Packets",
        group: "Flow Information",
        description: "Total packets sent in the forward direction.",
    },
    {
        name: "Total Backward Packets",
        label: "Total Backward Packets",
        group: "Flow Information",
        description: "Total packets sent in the backward direction.",
    },
    {
        name: "Total Length of Fwd Packets",
        label: "Total Forward Packet Length",
        group: "Flow Information",
        description: "Total bytes sent in the forward direction.",
    },
    {
        name: "Total Length of Bwd Packets",
        label: "Total Backward Packet Length",
        group: "Flow Information",
        description: "Total bytes sent in the backward direction.",
    },


    // ─────────────────────────────────────────
    // Packet Statistics
    // ─────────────────────────────────────────

    {
        name: "Flow Bytes/s",
        label: "Flow Bytes / Second",
        group: "Packet Statistics",
        description: "Average bytes transferred per second.",
    },
    {
        name: "Flow Packets/s",
        label: "Flow Packets / Second",
        group: "Packet Statistics",
        description: "Average packets transferred per second.",
    },
    {
        name: "Flow IAT Mean",
        label: "Flow IAT Mean",
        group: "Packet Statistics",
        description: "Mean flow inter-arrival time.",
    },
    {
        name: "Flow IAT Std",
        label: "Flow IAT Std",
        group: "Packet Statistics",
        description: "Standard deviation of flow inter-arrival time.",
    },
    {
        name: "Flow IAT Max",
        label: "Flow IAT Max",
        group: "Packet Statistics",
        description: "Maximum flow inter-arrival time.",
    },
    {
        name: "Flow IAT Min",
        label: "Flow IAT Min",
        group: "Packet Statistics",
        description: "Minimum flow inter-arrival time.",
    },
    {
        name: "Min Packet Length",
        label: "Minimum Packet Length",
        group: "Packet Statistics",
        description: "Minimum observed packet length.",
    },
    {
        name: "Max Packet Length",
        label: "Maximum Packet Length",
        group: "Packet Statistics",
        description: "Maximum observed packet length.",
    },
    {
        name: "Packet Length Mean",
        label: "Packet Length Mean",
        group: "Packet Statistics",
        description: "Mean packet length.",
    },
    {
        name: "Packet Length Std",
        label: "Packet Length Std",
        group: "Packet Statistics",
        description: "Standard deviation of packet length.",
    },
    {
        name: "Packet Length Variance",
        label: "Packet Length Variance",
        group: "Packet Statistics",
        description: "Variance of packet length.",
    },
    {
        name: "Down/Up Ratio",
        label: "Down / Up Ratio",
        group: "Packet Statistics",
        description: "Ratio between backward and forward traffic.",
    },
    {
        name: "Average Packet Size",
        label: "Average Packet Size",
        group: "Packet Statistics",
        description: "Average size of network packets.",
    },


    // ─────────────────────────────────────────
    // Forward Traffic
    // ─────────────────────────────────────────

    {
        name: "Fwd Packet Length Max",
        label: "Forward Packet Length Max",
        group: "Forward Traffic",
        description: "Maximum forward packet length.",
    },
    {
        name: "Fwd Packet Length Min",
        label: "Forward Packet Length Min",
        group: "Forward Traffic",
        description: "Minimum forward packet length.",
    },
    {
        name: "Fwd Packet Length Mean",
        label: "Forward Packet Length Mean",
        group: "Forward Traffic",
        description: "Mean forward packet length.",
    },
    {
        name: "Fwd Packet Length Std",
        label: "Forward Packet Length Std",
        group: "Forward Traffic",
        description: "Standard deviation of forward packet lengths.",
    },
    {
        name: "Fwd Packets/s",
        label: "Forward Packets / Second",
        group: "Forward Traffic",
        description: "Forward packet rate.",
    },
    {
        name: "Fwd IAT Total",
        label: "Forward IAT Total",
        group: "Forward Traffic",
        description: "Total forward inter-arrival time.",
    },
    {
        name: "Fwd IAT Mean",
        label: "Forward IAT Mean",
        group: "Forward Traffic",
        description: "Mean forward inter-arrival time.",
    },
    {
        name: "Fwd IAT Std",
        label: "Forward IAT Std",
        group: "Forward Traffic",
        description: "Standard deviation of forward IAT.",
    },
    {
        name: "Fwd IAT Max",
        label: "Forward IAT Max",
        group: "Forward Traffic",
        description: "Maximum forward inter-arrival time.",
    },
    {
        name: "Fwd IAT Min",
        label: "Forward IAT Min",
        group: "Forward Traffic",
        description: "Minimum forward inter-arrival time.",
    },
    {
        name: "Fwd PSH Flags",
        label: "Forward PSH Flags",
        group: "Forward Traffic",
        description: "Number of PSH flags in forward traffic.",
    },
    {
        name: "Fwd URG Flags",
        label: "Forward URG Flags",
        group: "Forward Traffic",
        description: "Number of URG flags in forward traffic.",
    },
    {
        name: "Fwd Header Length",
        label: "Forward Header Length",
        group: "Forward Traffic",
        description: "Total forward header length.",
    },
    {
        name: "Subflow Fwd Packets",
        label: "Subflow Forward Packets",
        group: "Forward Traffic",
        description: "Forward packets within the subflow.",
    },
    {
        name: "Subflow Fwd Bytes",
        label: "Subflow Forward Bytes",
        group: "Forward Traffic",
        description: "Forward bytes within the subflow.",
    },
    {
        name: "Avg Fwd Segment Size",
        label: "Average Forward Segment Size",
        group: "Forward Traffic",
        description: "Average forward segment size.",
    },
    {
        name: "Fwd Avg Bytes/Bulk",
        label: "Forward Average Bytes / Bulk",
        group: "Forward Traffic",
        description: "Average bytes transferred per forward bulk.",
    },
    {
        name: "Fwd Avg Packets/Bulk",
        label: "Forward Average Packets / Bulk",
        group: "Forward Traffic",
        description: "Average packets per forward bulk.",
    },
    {
        name: "Fwd Avg Bulk Rate",
        label: "Forward Average Bulk Rate",
        group: "Forward Traffic",
        description: "Average forward bulk transfer rate.",
    },
    {
        name: "Init_Win_bytes_forward",
        label: "Initial Forward Window Bytes",
        group: "Forward Traffic",
        description: "Initial TCP window size in the forward direction.",
    },
    {
        name: "act_data_pkt_fwd",
        label: "Active Data Packets Forward",
        group: "Forward Traffic",
        description: "Number of forward packets containing active data.",
    },
    {
        name: "min_seg_size_forward",
        label: "Minimum Forward Segment Size",
        group: "Forward Traffic",
        description: "Minimum segment size in the forward direction.",
    },


    // ─────────────────────────────────────────
    // Backward Traffic
    // ─────────────────────────────────────────

    {
        name: "Bwd Packet Length Max",
        label: "Backward Packet Length Max",
        group: "Backward Traffic",
        description: "Maximum backward packet length.",
    },
    {
        name: "Bwd Packet Length Min",
        label: "Backward Packet Length Min",
        group: "Backward Traffic",
        description: "Minimum backward packet length.",
    },
    {
        name: "Bwd Packet Length Mean",
        label: "Backward Packet Length Mean",
        group: "Backward Traffic",
        description: "Mean backward packet length.",
    },
    {
        name: "Bwd Packet Length Std",
        label: "Backward Packet Length Std",
        group: "Backward Traffic",
        description: "Standard deviation of backward packet lengths.",
    },
    {
        name: "Bwd Packets/s",
        label: "Backward Packets / Second",
        group: "Backward Traffic",
        description: "Backward packet rate.",
    },
    {
        name: "Bwd IAT Total",
        label: "Backward IAT Total",
        group: "Backward Traffic",
        description: "Total backward inter-arrival time.",
    },
    {
        name: "Bwd IAT Mean",
        label: "Backward IAT Mean",
        group: "Backward Traffic",
        description: "Mean backward inter-arrival time.",
    },
    {
        name: "Bwd IAT Std",
        label: "Backward IAT Std",
        group: "Backward Traffic",
        description: "Standard deviation of backward IAT.",
    },
    {
        name: "Bwd IAT Max",
        label: "Backward IAT Max",
        group: "Backward Traffic",
        description: "Maximum backward inter-arrival time.",
    },
    {
        name: "Bwd IAT Min",
        label: "Backward IAT Min",
        group: "Backward Traffic",
        description: "Minimum backward inter-arrival time.",
    },
    {
        name: "Bwd PSH Flags",
        label: "Backward PSH Flags",
        group: "Backward Traffic",
        description: "Number of PSH flags in backward traffic.",
    },
    {
        name: "Bwd URG Flags",
        label: "Backward URG Flags",
        group: "Backward Traffic",
        description: "Number of URG flags in backward traffic.",
    },
    {
        name: "Bwd Header Length",
        label: "Backward Header Length",
        group: "Backward Traffic",
        description: "Total backward header length.",
    },
    {
        name: "Subflow Bwd Packets",
        label: "Subflow Backward Packets",
        group: "Backward Traffic",
        description: "Backward packets within the subflow.",
    },
    {
        name: "Subflow Bwd Bytes",
        label: "Subflow Backward Bytes",
        group: "Backward Traffic",
        description: "Backward bytes within the subflow.",
    },
    {
        name: "Avg Bwd Segment Size",
        label: "Average Backward Segment Size",
        group: "Backward Traffic",
        description: "Average backward segment size.",
    },
    {
        name: "Bwd Avg Bytes/Bulk",
        label: "Backward Average Bytes / Bulk",
        group: "Backward Traffic",
        description: "Average bytes transferred per backward bulk.",
    },
    {
        name: "Bwd Avg Packets/Bulk",
        label: "Backward Average Packets / Bulk",
        group: "Backward Traffic",
        description: "Average packets per backward bulk.",
    },
    {
        name: "Bwd Avg Bulk Rate",
        label: "Backward Average Bulk Rate",
        group: "Backward Traffic",
        description: "Average backward bulk transfer rate.",
    },
    {
        name: "Init_Win_bytes_backward",
        label: "Initial Backward Window Bytes",
        group: "Backward Traffic",
        description: "Initial TCP window size in the backward direction.",
    },


    // ─────────────────────────────────────────
    // Flags & Headers
    // ─────────────────────────────────────────

    {
        name: "FIN Flag Count",
        label: "FIN Flag Count",
        group: "Flags & Headers",
        description: "Number of FIN flags.",
    },
    {
        name: "SYN Flag Count",
        label: "SYN Flag Count",
        group: "Flags & Headers",
        description: "Number of SYN flags.",
    },
    {
        name: "RST Flag Count",
        label: "RST Flag Count",
        group: "Flags & Headers",
        description: "Number of RST flags.",
    },
    {
        name: "PSH Flag Count",
        label: "PSH Flag Count",
        group: "Flags & Headers",
        description: "Number of PSH flags.",
    },
    {
        name: "ACK Flag Count",
        label: "ACK Flag Count",
        group: "Flags & Headers",
        description: "Number of ACK flags.",
    },
    {
        name: "URG Flag Count",
        label: "URG Flag Count",
        group: "Flags & Headers",
        description: "Number of URG flags.",
    },
    {
        name: "CWE Flag Count",
        label: "CWE Flag Count",
        group: "Flags & Headers",
        description: "Number of CWE flags.",
    },
    {
        name: "ECE Flag Count",
        label: "ECE Flag Count",
        group: "Flags & Headers",
        description: "Number of ECE flags.",
    },
    {
        name: "Fwd Header Length.1",
        label: "Forward Header Length (Derived)",
        group: "Flags & Headers",
        description: "Additional forward header-length feature from the CIC-IDS2017 schema.",
    },


    // ─────────────────────────────────────────
    // Timing & Activity
    // ─────────────────────────────────────────

    {
        name: "Active Mean",
        label: "Active Mean",
        group: "Timing & Activity",
        description: "Mean active duration.",
    },
    {
        name: "Active Std",
        label: "Active Std",
        group: "Timing & Activity",
        description: "Standard deviation of active duration.",
    },
    {
        name: "Active Max",
        label: "Active Max",
        group: "Timing & Activity",
        description: "Maximum active duration.",
    },
    {
        name: "Active Min",
        label: "Active Min",
        group: "Timing & Activity",
        description: "Minimum active duration.",
    },
    {
        name: "Idle Mean",
        label: "Idle Mean",
        group: "Timing & Activity",
        description: "Mean idle duration.",
    },
    {
        name: "Idle Std",
        label: "Idle Std",
        group: "Timing & Activity",
        description: "Standard deviation of idle duration.",
    },
    {
        name: "Idle Max",
        label: "Idle Max",
        group: "Timing & Activity",
        description: "Maximum idle duration.",
    },
    {
        name: "Idle Min",
        label: "Idle Min",
        group: "Timing & Activity",
        description: "Minimum idle duration.",
    },
]