all: clean build

.DEFAULT: all
.PHONY: clean distclean

clean:
	rm -f tagbox*js

distclean: clean
	rm -rf lib/compiler.jar lib/jquery-1.8-extern.js

build: \
	tagbox.js \
	tagbox.min.js


tagbox.js: \
	src/_begin.js \
	lib/fuzzyMatch.js \
	src/DropdownRow.js \
	src/CompletionDropdown.js \
	src/Token.js \
	src/TagBox.js \
	src/fn.tagbox.js \
	src/_end.js


lib/compiler.jar:
	wget -O- http://closure-compiler.googlecode.com/files/compiler-20120430.tar.gz | tar -xz -C lib compiler.jar

lib/jquery-1.8-extern.js:
	wget -O $@ http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.8.js

tagbox.min.js: \
	tagbox.js \
	lib/compiler.jar \
	lib/jquery-1.8-extern.js \

	java -jar lib/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --externs lib/jquery-1.8-extern.js < $< > $@

tagbox.js:
	@rm -f $@
	cat $^ > $@
