coffee_compiler = coffee -p
coffee_sourses = $(shell find . -iname *.coffee 2>/dev/null)

sass_compiler = sass --update --trace -q
sass_sourses = $(shell find . -iname *.sass 2>/dev/null)

scss_compiler = $(sass_COMPILER) --scss
scss_sourses = $(shell find . -iname *.scss 2>/dev/null)

.PHONY: filelist
filelist:
ifneq ($(strip $(coffee_sourses)),)
	@echo "Coffee Sources:"
	@echo $(coffee_sourses)
endif
ifneq ($(strip $(sass_sourses)),)
	@echo "Sass Sources:"
	@echo $(sass_sourses)
endif
ifneq ($(strip $(scss_sourses)),)
	@echo "Scss Sources:"
	@echo $(scss_sourses)
endif

%.js: %.coffee
	@echo "Compiling [$<] ..."
	$(coffee_compiler) $< 

%.css: %.scss
	@echo "Compiling [$<] ..."

%.css: %.sass
	@echo "Compiling [$<] ..."

brew_coffee: $(coffee_sourses:.coffee=.js)
brew_sass: $(sass_sourses:.sass=.css) $(scss_sourses:.scss=.css)

build: brew_coffee brew_sass
