require 'rake_subdir'

task :default => [:build]

desc "Compile all the sources in the working directory."
task :build do
  rake_subdir 'JapaneseEmoticons'
end

desc "Clean all the generated files from working directory."
task :clean_workplace do
  rake_subdir 'JapaneseEmoticons' => 'clean'
end

desc "Clean all generated files."
task :clean => [:clean_workplace] do
  sh 'rm -rf ./bin'
end

directory 'bin'
desc "Generate extension in bin folder."
task :cook => [:build, 'bin'] do
  sh "cp -r JapaneseEmoticons ./bin/"
  %w[*.coffee *.sass Rakefile .DC_Store].each do |pattern|
    sh "find ./bin -iname #{pattern} | xargs rm"
  end
end

desc "Generated an archived version ready for upload."
task :release => [:cook] do
  sh 'cd ./bin && zip -r JapaneseEmoticons.zip JapaneseEmoticons/*'
end
