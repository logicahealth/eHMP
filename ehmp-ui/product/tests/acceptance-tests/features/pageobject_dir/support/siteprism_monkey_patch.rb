module SitePrism
  module ElementContainer
    def create_invisibility_waiter(element_name, *find_args)
      method_name = "wait_until_#{element_name}_invisible"
      create_helper_method method_name, *find_args do
        define_method method_name do |timeout = Waiter.default_wait_time, *runtime_args|
          Timeout.timeout timeout, SitePrism::TimeOutWaitingForElementInvisibility do
            start_time = Time.now
            Capybara.using_wait_time 0 do
              begin
                sleep 0.05 while element_exists?(*find_args, *runtime_args, visible: true)
              rescue => e
                if Time.now - start_time > timeout
                  p Time.now - start_time
                  raise
                else
                  p "OVERWRITTEN INVISIBLITY CHECK: #{e.message}: retry"
                  retry
                end # if
              end # rescue
            end
          end
        end
      end
    end # create_invisibility

    def create_visibility_waiter(element_name, *find_args)
      method_name = "wait_until_#{element_name}_visible"
      create_helper_method method_name, *find_args do
        define_method method_name do |timeout = Waiter.default_wait_time, *runtime_args|
          Timeout.timeout timeout, SitePrism::TimeOutWaitingForElementVisibility do
            # p "in special visible #{find_args}"
            start_time = Time.now
            Capybara.using_wait_time 0 do
              begin
                sleep 0.05 until element_exists?(*find_args, *runtime_args, visible: true)
              rescue => e
                if Time.now - start_time > timeout
                  p Time.now - start_time
                  raise
                else
                  p "OVERWRITTEN VISIBLITY CHECK: #{e.message}: retry"
                  retry
                end # if
              end # rescue
            end  #Capybara.using_wait_time
          end # Timeout
        end # define_method
      end #create_helper
    end #create_visibility
  end # module
end #module
