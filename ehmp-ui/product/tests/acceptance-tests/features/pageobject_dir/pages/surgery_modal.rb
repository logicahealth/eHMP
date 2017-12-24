# http://tianhsky.ueuo.com/blog/2012/03/18/ruby-class-inheritances-vs-extend-vs-include/
# include: you can consider this is equivalent to copying the code from wherever it includes from
module DescriptiveAllThere
  def all_there?
    # p "special all_there"
    Capybara.using_wait_time(0) do
      has_functions = self.class.mapped_items.map { |element| "has_#{element}?" }
      has_functions.each do | element_has_function |
        unless send(element_has_function)
          p "#{element_has_function} failed"
          return false
        end
      end
      return true
    end
  end
end

class SurgeryDetailModal < SitePrism::Page
  include DescriptiveAllThere
  elements :fld_headers, '.row strong'
  element :fld_details_section, :xpath, "//h5[contains(string(), 'Details')]"
  element :fld_facility, '[data-detail=facility]'
  element :fld_type, '[data-detail=type]'
  element :fld_date, '[data-detail=date-time]'
  element :fld_status, '[data-detail=status]'
  
  element :fld_results_section, '.results-region h5'
end
