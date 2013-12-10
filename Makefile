PROJECT_FOLDER = JapaneseEmoticons

coffee_COMPILER = coffee --compile
sass_COMPILER = sass --update --trace -q
scss_COMPILER = $(sass_COMPILER) --scss

copy:
	cp -r ./$(PROJECT_FOLDER) ./cooked/

coffee scss sass:
	$(eval files := $(shell find ./cooked/$(PROJECT_FOLDER) -iname *.$@ | tr \\n "\ \n"))
	@if [ "$(files)" != "" ]; then \
		echo ">>>>>> Compiling $@"; \
		$($@_COMPILER) $(files) && rm $(files); \
	fi

clean:
	rm -r ./cooked/$(PROJECT_FOLDER)

build: copy coffee sass scss
	@echo Done!
