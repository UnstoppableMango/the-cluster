namespace UnMango.TheCluster.AutoScalingTranscodeSet.V1Alpha1

[<Struct>]
type Status = { CurrentJobs: string }

[<Struct>]
type Spec = { MinJobs: string; MaxJobs: string }
