package commands

import "github.com/urfave/cli/v3"

// InitCommand makes a folder a Docket project, writing its docket.yaml.
func InitCommand() *cli.Command {
	return &cli.Command{
		Name:     "init",
		Category: settingUp,
		Usage:    "Make a folder a Docket project",
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "id", Usage: "the project's `ID`"},
			&cli.StringFlag{Name: "name", Usage: "the project's `NAME`"},
			&cli.StringFlag{Name: "product", Usage: "the `ID` of the product it's part of"},
		},
		Action: notBuiltAction,
	}
}
