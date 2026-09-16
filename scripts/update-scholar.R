# Refresh Google Scholar headline metrics for the website.
# Google Scholar blocks cloud servers, so run this from your own computer, e.g. monthly:
#   cd path/to/feargalryan.com && Rscript scripts/update-scholar.R
# then commit and push src/data/scholar.json.

if (!requireNamespace("scholar", quietly = TRUE)) install.packages("scholar")
if (!requireNamespace("jsonlite", quietly = TRUE)) install.packages("jsonlite")

id <- "9hGB7goAAAAJ"
profile <- scholar::get_profile(id)
history <- scholar::get_citation_history(id)

out <- list(
  retrieved = format(Sys.Date()),
  source = paste0("https://scholar.google.com/citations?user=", id),
  citations = profile$total_cites,
  h_index = profile$h_index,
  i10_index = profile$i10_index,
  per_year = lapply(seq_len(nrow(history)), function(i) list(year = history$year[i], cites = history$cites[i]))
)

path <- "src/data/scholar.json"
if (!dir.exists(dirname(path))) stop("Run this from the website folder (the one containing package.json).")
jsonlite::write_json(out, path, auto_unbox = TRUE, pretty = TRUE)
message("Wrote ", normalizePath(path), ": ", out$citations, " citations, h-index ", out$h_index)
