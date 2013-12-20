#Japanese Emoticons

[chrome extension]

- - - - - -
**WARNING** You are on a developer branch, it might be incomplete and riddled with bugs.
At the time of writing the version 2.0 is completely **empty**, as I am planning to rewrite the code-base.
- - - - - -

Extension that allows for very quick access to an extensive library of Japanese text based emojis.

### A humongous library of excellent text-bases emojis just a click away.

A convenient way to access a humongous library of emoticons. Perfect for all kinds of online interactions. 

There is something magical about Japanese emojis, they are a bit funky but unlike western ones they really excel at conveying emotions, and at the same time supported everywhere where unicode is allowed(count it as everywhere by now).

Unfortunately I could not find a worthwhile solution to get those emojis quickly without having to copy them from somewhere, and I missed the way you get to pick 'ascii' emojis on the iPhone. So this is my small homage to fill the missing niche that should have filled a long time ago, yet somehow wasn't.

Have pleasure using it. Those for whom it was written will certainly appreciate it.

Emojis are provided by JapaneseEmoticons.net.

![screeenshot](http://i.imgur.com/nI75tBv.png)

![screeenshot](http://i.imgur.com/AYNcTeB.png)

![screeenshot](http://i.imgur.com/H9tNI2T.png)

![screeenshot](http://i.imgur.com/8Gntqx3.png)

## Building instructions
###Prerequisites
Make sure you have the following installed:
```   
ruby
bundler
coffee-script
```
Then run the rollowing:
```shell
$ bundle install
```

###Bilding
To build run
```shell
$ rake cook
```
To create deployable archive run:
```shell
$ rake release
```
To clean up run:
```shell
$ rake clean
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
