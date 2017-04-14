default['xvfb']['display'] = ':0'
default['xvfb']['screennum']  = '0'
default['xvfb']['dimensions'] = '1280x1024x24'
default['xvfb']['args'] = nil

default['xvfb']['packages']['debian'] =
  %w(xfonts-100dpi xfonts-75dpi xfonts-scalable xserver-xorg-core xvfb)

default['xvfb']['packages']['rhel'] =
  %w(xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-fonts-Type1 xorg-x11-server-Xvfb mesa-libGL)
