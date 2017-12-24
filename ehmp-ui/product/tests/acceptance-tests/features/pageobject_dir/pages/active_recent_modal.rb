class ActiveRecentMedModal < ModalElements
  element :fld_order_history_label, :xpath, "//*[@class='order-historylist']/preceding-sibling::*"
  elements :order_history_dates, ".order-historylist .order-dates"
  element :fld_med_detail, "div.medication-detail"
  element :fld_med_review_banner, ".alert-info"

  def initialize
    super
    add_navigation_btns
  end
end
