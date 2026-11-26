package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	turnhttp "github.com/exalynt/turn/http"
	"github.com/exalynt/turn/paginator"
	"github.com/exalynt/turn/paginator/offset"
)

// offsetQuery reads numbered page selections from the page and size query
// parameters, and builds the URLs of adjacent pages from them.
var offsetQuery turnhttp.OffsetQuery

// totalCountHeader is the response header a list says how many items match
// across every page in.
const totalCountHeader = "X-Total-Count"

// pagePolicy is every list's page size: lists are worked out in memory, and
// views such as the map want everything, so pages are large.
var pagePolicy = paginator.Policy{DefaultSize: 100, MaxSize: 500}

// writePage writes one page of items, all of a list worked out in memory, as
// a bare JSON array: the page the page and size query parameters select, with
// a Link header to the pages around it and X-Total-Count saying how many
// there are in all. A page selection that isn't one is a 400.
func writePage[T any](w http.ResponseWriter, r *http.Request, items []T) {
	pages, err := offset.New[T](offset.Options{Policy: pagePolicy})
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "something went wrong")
		return
	}
	selector, err := offsetQuery.Parse(r.URL.Query())
	if err == nil {
		var plan offset.Plan
		if plan, err = pages.Plan(selector); err == nil {
			start := min(int(plan.Offset), len(items))
			end := min(start+plan.Limit(), len(items))
			var page offset.Page[T]
			if page, err = pages.Page(plan, items[start:end]); err == nil {
				w.Header().Set(totalCountHeader, strconv.Itoa(len(items)))
				if page.Number > 1 || page.HasMore {
					if links := turnhttp.FormatLinks(turnhttp.OffsetLinks(page, offsetQuery.URL(r.URL))...); links != "" {
						w.Header().Set("Link", links)
					}
				}
				render.JSON(w, r, page.Items)
				return
			}
		}
	}
	if paginator.IsSelectorError(err) {
		writeError(w, r, http.StatusBadRequest, invalidPageMessage(err))
		return
	}
	writeError(w, r, http.StatusInternalServerError, "something went wrong")
}

// invalidPageMessage describes why a page selection was rejected.
func invalidPageMessage(err error) string {
	if errors.Is(err, paginator.ErrInvalidSize) {
		return "invalid size: must be an integer between 1 and 500"
	}
	return "invalid page: must be an integer from 1"
}
