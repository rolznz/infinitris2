LANGUAGE=$1
wrap () { yarn formatjs compile "src/internationalization/lang/$LANGUAGE.json" --ast --out-file "src/internationalization/compiled-lang/$LANGUAGE.json" | cat; }; wrap