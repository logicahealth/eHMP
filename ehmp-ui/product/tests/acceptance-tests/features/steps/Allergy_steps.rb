  path = File.expand_path '..', __FILE__
  $LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
  path = File.expand_path '../../../../shared-test-ruby', __FILE__
  $LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
  path = File.expand_path '../helper', __FILE__
  $LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

  require 'AccessBrowserV2.rb'

  Given(/^the allergies applet displays at least (\d+) allergy rows$/) do |num_required_allergies|
    @ehmp = PobAllergiesApplet.new
    @ehmp.wait_for_expanded_rows
    expect(@ehmp.expanded_rows.length).to be > num_required_allergies.to_i, "Prerequisite for test: num allergies >= #{num_required_allergies}. Currently there are only #{@ehmp.expanded_rows.length}"
  end

  Given(/^the user notes the first (\d+) allergies$/) do |num_allergies|
    @ehmp = PobAllergiesApplet.new
    @titles = @ehmp.expanded_allergy_names
    p @titles
    expect(@titles.length).to be > num_allergies.to_i
    @titles = @titles[0..num_allergies.to_i - 1]
    p @titles
  end

  Given(/^user opens the first allergy row detail$/) do
    @ehmp = PobAllergiesApplet.new
    expect(@ehmp.expanded_rows.length).to be > 0
    @ehmp.expanded_rows.first.click
    @ehmp = ModalElements.new
    @ehmp.wait_for_fld_modal_title
    expect(@ehmp).to have_fld_modal_title
  end

  Then(/^the Allergy Previous button is disabled$/) do
    ehmp = AllergyModal.new
    ehmp.wait_for_btn_previous
    expect(ehmp).to have_btn_previous
    expect(ehmp.btn_previous.disabled?).to eq(true), "The Previous button is not disabled"
  end

  When(/^user opens the last allergy row detail$/) do
    @ehmp = PobAllergiesApplet.new
    expect(@ehmp.expanded_rows.length).to be > 0
    @ehmp.expanded_rows.last.click
    @ehmp = ModalElements.new
    @ehmp.wait_for_fld_modal_title
    expect(@ehmp).to have_fld_modal_title
  end

  Then(/^the Allergy Next button is disabled$/) do
    ehmp = AllergyModal.new
    ehmp.wait_for_btn_next
    expect(ehmp).to have_btn_next
    expect(ehmp.btn_next.disabled?).to eq(true), "The Next button is not disabled"
  end

  Then(/^the user can step through the allergies using the next button$/) do
    allergy_modal = AllergyModal.new
    @titles.each do | modal_title |
      expected_title = "ALLERGEN - #{modal_title.upcase}"
      begin
        wait_until { allergy_modal.fld_modal_title.text.upcase.eql? expected_title }
      rescue Timeout::Error
        raise "Expected #{allergy_modal.fld_modal_title.text} to be #{expected_title}"
      end
      allergy_modal.btn_next.click
    end
  end

  Then(/^the user can step through the allergies using the previous button$/) do
    allergy_modal = AllergyModal.new
    allergy_modal.btn_previous.click
    @titles.reverse.each { |modal_title| 
      expected_title = "ALLERGEN - #{modal_title.upcase}"
      begin
        wait_until { allergy_modal.fld_modal_title.text.upcase.eql? expected_title }
      rescue Timeout::Error
        raise "Expected #{allergy_modal.fld_modal_title.text} to be #{expected_title}"
      end
      allergy_modal.btn_previous.click
    }
  end
