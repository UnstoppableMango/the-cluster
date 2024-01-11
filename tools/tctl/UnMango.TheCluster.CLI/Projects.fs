module UnMango.TheCluster.CLI.Projects

open System.IO
open System.Reflection
open Fluid

module private Templates =
    let parser = FluidParser()
    let executingAssembly = lazy Assembly.GetExecutingAssembly()

    // yucc
    let template m t =
        let suc, tmpl, err = parser.TryParse t

        if suc then
            tmpl.Render(TemplateContext(m, true))
        else
            failwithf $"Error: %s{err}"

    let templateAll m = Seq.map (template m)

    let readResource: string -> string =
        let readStream (stream: Stream) =
            use reader = new StreamReader(stream)
            reader.ReadToEnd()

        executingAssembly.Value.GetManifestResourceStream >> readStream

    let readResources: string seq -> string seq = Seq.map readResource
    let templateResource model = readResource >> template model
    let templateResources model = Seq.map (templateResource model)

    let all = executingAssembly.Value.GetManifestResourceNames() :> string seq

let template =
    let impl dir model =
        let format file =
            $"UnMango.TheCluster.CLI.templates.%s{dir}.%s{file}.liquid"

        let toTemplate _ =
            format >> Templates.templateResource model

        Seq.pairwise >> Map >> Map.map toTemplate

    // Just so we can swap the argument order
    fun files dir model -> impl dir model files

module Ts =
    let files = [ "Chart.yaml"; "config.ts"; "index.ts"; "oauth.ts"; "package.json" ]
    let template model = template files "typescript" model

module Fs =
    let files = [ "Name.fsproj"; "Program.fs" ]
    let template model = template files "fsharp" model
