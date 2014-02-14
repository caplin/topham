topham
======

A Controller for Node, a bit like the gradle daemon.

It runs as a server, and can process node commands sent to it.

Obviously it's not secure.  Don't run this on the public internet.

    $ npm install -g topham

To run the server

    topham -p 3478 serve

To tell the server to do something (e.g. run lessc)

    topham -H localhost -p 3478 lessc example.less


