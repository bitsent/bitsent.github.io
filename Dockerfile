FROM jekyll/jekyll

COPY / .

RUN bundle install --quiet --clean

CMD ["jekyll", "serve"]
