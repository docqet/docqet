package commands

import (
	"context"
	"fmt"

	"github.com/urfave/cli/v3"
)

// sourceFlags are the flags every read takes to say which states it reads:
// the working tree's by default, a commit's, or the server's, and this
// project's alone or the whole product's. Outside a repository, --product=ID
// or --project=ID says which.
func sourceFlags() []cli.Flag {
	return []cli.Flag{
		&cli.StringFlag{
			Name:  "at",
			Usage: "read `REV`, any commit, branch or tag, instead of the working tree",
		},
		&cli.BoolFlag{
			Name:  "remote",
			Usage: "read what the server has applied, instead of the repository",
		},
		productFlag("read the whole product, not just this project; outside a repository, name it with --product=ID"),
		&cli.StringFlag{
			Name:  "project",
			Usage: "outside a repository, read project `ID` from the server",
		},
	}
}

// withSourceFlags returns flags with the source flags after them.
func withSourceFlags(flags ...cli.Flag) []cli.Flag {
	return append(flags, sourceFlags()...)
}

// productFlag is --product[=ID], with usage: the whole product, rather than
// this project alone. Given bare, it's the product docqet.yaml names. With an
// ID after =, it's that product, which outside a repository is the only way to
// say which, and inside one must be the product docqet.yaml names. Like git's
// --color[=when], the ID only follows =, so --product hotel leaves hotel as
// an argument: maxArgs points that out.
func productFlag(usage string) cli.Flag {
	f := optionalValueFlag{&cli.FlagBase[string, cli.NoConfig, productValue]{Name: "product", Usage: usage}}
	// Help asks the inner flag, so point it back at f.
	f.SetStringer(func(cli.Flag) string { return cli.FlagStringer(f) })
	return f
}

// optionalValueFlag shows a flag in help as if it took no value, as
// --product rather than --product ID, so nobody reads it as taking one after
// a space. Its usage says how to give it one with =.
type optionalValueFlag struct {
	*cli.FlagBase[string, cli.NoConfig, productValue]
}

func (optionalValueFlag) TakesValue() bool { return false }

// product reports whether --product was given, and the ID it was given, which
// is empty when it was given bare.
func product(cmd *cli.Command) (given bool, id string) {
	if !cmd.IsSet("product") {
		return false, ""
	}
	if id = cmd.String("product"); id == bareProduct {
		id = ""
	}
	return true, id
}

// bareProduct is what --product holds when given without an ID: urfave sets a
// flag whose value is a bool flag to "true" when it's given bare. So no
// product can be called "true".
const bareProduct = "true"

// productValue holds --product's value. It says it's a bool flag, so urfave
// never takes the next argument as its value, only what follows =.
type productValue struct {
	destination *string
}

func (productValue) Create(val string, p *string, _ cli.NoConfig) cli.Value {
	*p = val
	return &productValue{destination: p}
}

func (productValue) ToString(val string) string { return val }

func (v *productValue) Set(s string) error {
	*v.destination = s
	return nil
}

func (v *productValue) Get() any { return *v.destination }

func (v *productValue) String() string {
	if v.destination == nil {
		return ""
	}
	return *v.destination
}

func (v *productValue) IsBoolFlag() bool { return true }

// maxArgs refuses more than max arguments. When --product was given bare and
// there's one too many, the extra one was most likely meant as its ID, so it
// says how to write that.
func maxArgs(max int) cli.BeforeFunc {
	return func(ctx context.Context, cmd *cli.Command) (context.Context, error) {
		args := cmd.Args().Slice()
		if len(args) <= max {
			return ctx, nil
		}
		if given, id := product(cmd); given && id == "" {
			return ctx, fmt.Errorf("unexpected argument %q: to name a product, write --product=%s", args[max], args[max])
		}
		switch max {
		case 0:
			return ctx, fmt.Errorf("%s takes no arguments, and was given %d", cmd.Name, len(args))
		case 1:
			return ctx, fmt.Errorf("%s takes at most 1 argument, and was given %d", cmd.Name, len(args))
		default:
			return ctx, fmt.Errorf("%s takes at most %d arguments, and was given %d", cmd.Name, max, len(args))
		}
	}
}
