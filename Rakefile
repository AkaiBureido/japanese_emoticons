require 'rake_subdir'

task :default => [:build]
task :build do
  rake_subdir 'JapaneseEmoticons'
end

task :clean_workplace do
  rake_subdir 'JapaneseEmoticons' => 'clean'
end

task :clean => [:clean_workplace] do
  sh 'rm -rf ./bin'
end

directory 'bin'
task :cook => [:build, 'bin'] do
  sh "cp -r JapaneseEmoticons ./bin/"
  %w[*.coffee *.sass Rakefile .DC_Store].each do |pattern|
    sh "find ./bin -iname #{pattern} | xargs rm"
  end
end

task :release => [:cook] do
  sh 'cd ./bin && zip -r JapaneseEmoticons.zip JapaneseEmoticons/*'
end
