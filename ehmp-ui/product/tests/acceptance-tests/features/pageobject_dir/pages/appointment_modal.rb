class AppointmentModal < ModalElements
  elements :fld_appointment_modal_headers, "#modal-body p strong"

  def initialize
    super
    add_navigation_btns
  end
end
