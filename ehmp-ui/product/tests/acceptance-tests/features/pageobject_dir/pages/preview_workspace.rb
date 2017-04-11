class PreviewApplet
  def initialize(name, type)
    @name = name
    @type = type
  end

  def eql?(other)
    return false unless other.instance_of?(self.class)
    return false unless @name == other.name
    return false unless @type == other.type
    return true
  end

  def ==(other)
    self.eql?(other)
  end

  protected

  attr_reader :name
  attr_reader :type
end

class PobPreviewWorkspace < SitePrism::Page
  element :fld_workspace_preview, ".workspace-preview"
  element :btn_close_preview, ".modal-footer .btn-primary"
  elements :fld_preview_applets, "#gridsterPreview li"

  def array_of_applets
    num_applets = fld_preview_applets.length
    preview_applets = []
    (1..num_applets).each do |i|
      self.class.element :fld_applet_title, "#gridsterPreview li:nth-child(#{i}) .applet-title"
      self.class.element :fld_applet_type, "#gridsterPreview li:nth-child(#{i}) .applet-type"
      preview_applets[i-1] = PreviewApplet.new(fld_applet_title.text, fld_applet_type.text)
    end
    preview_applets
  end
end
