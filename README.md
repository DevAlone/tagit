# tagit

Tagit is an extension which allows you to organize content in the WEB using tags. Right now it only supports comments on pikabu.ru.

# How to just use it

- Install on Firefox - https://addons.mozilla.org/en-US/firefox/addon/tagit/
- Install on Chrome -  https://chrome.google.com/webstore/detail/tagit/bomlmlmdlieoidkcnppnekdofpjljoch

# How to debug locally

0. IMPORTANT for Firefox users. Set `keepUuidOnUninstall` and `keepStorageOnUninstall` to `true` in `about:config` to prevent Firefox from deleting database when you delete temporarily version of this extension https://stackoverflow.com/questions/58284797/how-to-prevent-firefox-from-removing-my-extensions-data-when-i-remove-debug-ver
1. Clone this repository
2. install dependencies 
`npm install`
3. Run watch.sh
`./watch.sh`
4. Load `./build/manifest.json` using your favorite browser(Firefox or Chrome)

# How to build a production version

1. Clone this repository
2. Install dependencies 
`npm install`
3. Build
`./build.sh`

It will generate next files and directories:

- `build/` - production version of the extension
- `tagit.zip` - zipped production version of the extension
- `tagit_src.zip` - source code

# How to contribute

Just fix/implement what you want and make a pull request. Thanks :)

# Mirrors

- https://github.com/DevAlone/tagit
- https://bitbucket.org/d3dev/tagit
- https://gitlab.com/DevAlone/tagit

