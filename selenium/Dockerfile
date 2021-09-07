FROM selenium/standalone-chrome-debug:3.141.59

USER root
RUN apt-get update \
   && apt-get install -y -q --no-install-recommends \
   fonts-noto-cjk fonts-noto-cjk-extra language-selector-common language-pack-ja \
   && update-locale LANG=ja_JP.UTF-8 \
   && apt-get clean \
   && rm -r /var/lib/apt/lists/*

ENV LANG ja_JP.UTF-8
ENV LANGUAGE ja_JP:ja
ENV LC_ALL ja_JP.UTF-8

USER 1200

RUN x11vnc -storepasswd password ${HOME}/.vnc/passwd
