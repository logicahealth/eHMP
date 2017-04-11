class OrderDetailModal < ModalElements
  element :btn_order_next, '#ordersNext'
  element :btn_order_previous, '#ordersPrevious'
  element :btn_sign, '#ordersSignOrder'
  element :btn_discontinue, '#ordersDiscontinueOrder'

  element :fld_modal_content, '.detail-modal-content pre'
end
