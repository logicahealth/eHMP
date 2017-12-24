class Accordion
  include DriverUtility
  include PageObject

  def initialize(driver)
    @driver = driver
  end

  def clickAccordionByHeading(heading)
    click(:css, 'div[heading="' + heading + '"] a.accordion-toggle')
  end

  def collapseAccordionByHeading(heading)
    click(:css, 'div[heading="' + heading + '"] i.icon-accordion-active')
  end

  def getCollapsedAccordionLabelByHeading(heading)
    labelText = getTextForElement(:css, 'div[heading="' + heading + '"] div.panel-heading h4 a')

    label = labelText.split("Expand\n")
    return label[1]

  end

  def isAccordionCollapsed(heading)
    labelText = getTextForElement(:css, 'div[heading="' + heading + '"] div.panel-heading h4 a')

    if(labelText.include?("Expand"))
      return true
    else
      false
    end
  end

  def isAccordionExpanded(heading)
    labelText = getTextForElement(:css, 'div[heading="' + heading + '"] div.panel-heading h4 span span')
    labelText = [labelText]

    return true if(labelText.include?("Collapse"))
    false
  end

  def getTextForElement(tag, path)
    labelText = @driver.element(tag, path)
    labelText = labelText.text
  end

  def getElement(tag, path)
    labelText = @driver.element(tag, path)
  end

  def isRightArrowIconDisplayed(heading)
    element = getElement(:css, 'div[heading="' + heading + '"] div.panel-heading a i.myicon')
    classValue = element.attribute("class")

    if (classValue.include?("icon-accordion-static"))
      return true
    else
      return false
    end

  end

  def isDownArrowIconDisplayed(heading)
    element = getElement(:css, 'div[heading="' + heading + '"] div.panel-heading a i.myicon')
    p classValue = element.attribute("class")

    if (classValue.include?("icon-accordion-active"))
      return true
    else
      return false
    end

  end

  def getAccordionText(heading)
    return getTextForElement(:css, 'div[heading="' + heading + '"] div.panel-heading h4 span span')
  end

  def getAccordionLabelByHeading(heading)
    labelText = getTextForElement(:css, 'div[heading="' + heading + '"] div.panel-heading h4.accordion-panel-title')

    label = []

    if (labelText.include?("Collapse\n"))
      label = labelText.split("Collapse\n")
    elsif (labelText.include?("Expand\n"))
      label = labelText.split("Expand\n")
    end

    return label[1]
  end

  def getAccordionInfoElementByHeading(heading)
    return getElement(:css,  'div[heading="' + heading + '"] div.panel-heading h4 span')
  end

  def getNthAccordionName(number)
    return getTextForElement(:css, "form[name='assessmentForm'] div div:nth-child(" + number.to_s + ") h4 a")
  end

end
