#!/usr/bin/python3
#
# Copyright (c) 2013-2014 Pavol Rusnak <stick@gk2.sk>
#
# This file is part of Coinmap
#
# Coinmap is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#

import os
import json
import json.encoder
import parser as overpass_parser

scriptdir = os.path.dirname(os.path.abspath(__file__))

# call parser
pts = overpass_parser.get_points()
json.encoder.FLOAT_REPR = lambda x: str(x) # fix for 52.1989256 showing as 52.198925299999999
json.dump(pts, open(scriptdir + '/data-overpass-bitcoin.json', 'w'), separators = (',', ':'))
