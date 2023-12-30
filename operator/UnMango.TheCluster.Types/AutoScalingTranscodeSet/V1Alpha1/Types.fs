namespace UnMango.TheCluster.AutoScalingTranscodeSet.V1Alpha1

[<Struct>]
type Status = { CurrentJobs: int }

[<Struct>]
type Spec = { MinJobs: int; MaxJobs: int }
