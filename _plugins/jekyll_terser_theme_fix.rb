# frozen_string_literal: true

# jekyll-terser currently assumes every JS static file lives under site.source.
# With theme gems, static files can be absolute paths outside site.source.
# That breaks destination path computation and crashes with Errno::ENOENT.
#
# This patch keeps terser behavior for local project JS files and leaves theme
# gem static files untouched.

begin
  require "jekyll-terser"
rescue LoadError
  # If jekyll-terser is not installed, nothing to patch.
end

module Jekyll
  module Terser
    class TerserGenerator
      def generate(site)
        source_prefix = "#{site.source}#{File::SEPARATOR}"

        site.static_files.clone.each do |sf|
          next unless sf.is_a?(Jekyll::StaticFile)
          next unless sf.path.end_with?(".js")
          next if sf.path.end_with?(".min.js")
          next unless sf.path.start_with?(source_prefix)

          puts "Terser: Minifying #{sf.path}"
          site.static_files.delete(sf)
          name = File.basename(sf.path)
          destination = File.dirname(sf.path).sub(site.source, "")
          js_file = JSFile.new(site, site.source, destination, name, @terser)
          site.static_files << js_file
        end
      end
    end
  end
end
