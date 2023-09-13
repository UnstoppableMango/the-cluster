module Tests

open Pulumi.Automation
open Xunit
open System.Threading.Tasks
open System
open System.IO
open Xunit.Abstractions

type Fixture(messageSink: IMessageSink) =
    let workingDirectory = Environment.CurrentDirectory
    let projectDirectory = Directory.GetParent(workingDirectory).Parent.Parent.Parent.FullName

    let log message =
        messageSink.OnMessage(
            { new IDiagnosticMessage with
                member _.Message = message }
        )
        |> ignore

    let getStack name =
        task {
            let stackArgs = LocalProgramArgs(name, projectDirectory)
            return! LocalWorkspace.SelectStackAsync(stackArgs)
        }

    interface IAsyncLifetime with
        member this.InitializeAsync() : Task =
            task {
                let! stack = getStack "dev"
                let options = UpOptions(OnStandardOutput = log, OnStandardError = log)
                return! stack.UpAsync(options)
            }

        member this.DisposeAsync() : Task =
            task {
                let! stack = getStack "dev"
                let options = DestroyOptions(OnStandardOutput = log, OnStandardError = log)
                return! stack.DestroyAsync(options)
            }

type Tests(fixture: Fixture) =
    [<Fact>]
    let ``My test`` () = Assert.True(true)

    interface IClassFixture<Fixture>
