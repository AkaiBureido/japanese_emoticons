PROJECT_DIR = JapaneseEmoticons

.PHONY: clean
clean:
	-rm -rf ./cooked/$(PROJECT_DIR)

.PHONY: copy
copy:
	cp -r ./$(PROJECT_DIR) ./cooked/

.PHONY: build
build:
	make -C ./cooked/$(PROJECT_DIR) build

.PHONY: filelist
filelist:
	make -C ./cooked/$(PROJECT_DIR) filelist


