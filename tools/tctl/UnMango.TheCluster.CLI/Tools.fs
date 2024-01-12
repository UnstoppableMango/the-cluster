module UnMango.TheCluster.CLI.Tools

open System
open System.ComponentModel
open System.IO
open System.Threading
open System.Threading.Tasks
open CliWrap

let private run (command: Command) (args: string seq) directory cancellationToken =
    command
        .WithWorkingDirectory(directory)
        .WithArguments(args)
        .ExecuteAsync(cancellationToken)

module Npm =
    let command = Command("npm")
    let run = run command
    let install args = run ("install" :: args)
    let ci args = run ("ci" :: args)

module TalosCtl =
    let command = Command("talosctl")
    let run = run command
    let health args = run ("health" :: args)

module Builders =
    type State =
        { Command: Command
          CancellationToken: CancellationToken }

        static member initial name =
            { Command = Command(name)
              CancellationToken = CancellationToken.None }

    type CommandBuilder(name: string) =
        [<EditorBrowsable(EditorBrowsableState.Never)>]
        member this.Yield(_: unit) = State.initial name

        [<EditorBrowsable(EditorBrowsableState.Never)>]
        member _.Run(state: State) =
            state.Command.ExecuteAsync(state.CancellationToken)
            |> CommandTask.op_Implicit
            |> Async.AwaitTask

        [<CustomOperation("workingDirectory")>]
        member _.WorkingDirectory(state: State, directory: string) =
            { state with
                Command = state.Command.WithWorkingDirectory(directory) }

        [<CustomOperation("args")>]
        member _.Args(state: State, args: string seq) =
            { state with
                Command = state.Command.WithArguments(args) }

        [<CustomOperation("stderr")>]
        member _.StdErr(state: State, pipe: PipeTarget) =
            { state with
                Command = state.Command.WithStandardErrorPipe(pipe) }

        [<CustomOperation("stderr")>]
        member _.StdErr(state: State, stream: Stream) =
            let pipe = PipeTarget.ToStream(stream)
            { state with
                Command = state.Command.WithStandardErrorPipe(pipe) }

        [<CustomOperation("stdin")>]
        member _.StdIn(state: State, pipe: PipeSource) =
            { state with
                Command = state.Command.WithStandardInputPipe(pipe) }

        [<CustomOperation("stdout")>]
        member _.StdOut(state: State, pipe: PipeTarget) =
            { state with
                Command = state.Command.WithStandardOutputPipe(pipe) }

        [<CustomOperation("stdout")>]
        member _.StdOut(state: State, stream: Stream) =
            let pipe = PipeTarget.ToStream(stream)
            { state with
                Command = state.Command.WithStandardOutputPipe(pipe) }

let command name = Builders.CommandBuilder(name)

module PipeTo =
    let stdout = Console.OpenStandardOutput() |> PipeTarget.ToStream
    let stderr = Console.OpenStandardError() |> PipeTarget.ToStream
