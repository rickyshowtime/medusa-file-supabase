"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectDestructuringEmpty2 = _interopRequireDefault(require("@babel/runtime/helpers/objectDestructuringEmpty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _fs = require("fs");
var _storageJs = require("@supabase/storage-js");
var _nodeStream = require("node:stream");
var _medusaInterfaces = require("medusa-interfaces");
var _path = require("path");
var _stream = _interopRequireDefault(require("stream"));
var _promises = require("stream/promises");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var SupabaseService = /*#__PURE__*/function (_FileService) {
  (0, _inherits2["default"])(SupabaseService, _FileService);
  var _super = _createSuper(SupabaseService);
  function SupabaseService(_ref, options) {
    var _this;
    (0, _objectDestructuringEmpty2["default"])(_ref);
    (0, _classCallCheck2["default"])(this, SupabaseService);
    _this = _super.call(this);
    _this.project_ref = options.project_ref;
    _this.service_key = options.service_key;
    _this.bucket_name = options.bucket_name;
    _this.storage_version = options.storage_version, _this.storage_version = options.storage_version, _this.storage_api = "".concat(options.api_url, "/storage/").concat(_this.storage_version);
    _this.storage_url = "".concat(_this.storage_api, "/object/public"); //ToDo: implement support for private bucket
    return _this;
  }
  (0, _createClass2["default"])(SupabaseService, [{
    key: "storageClient",
    value: function storageClient() {
      return new _storageJs.StorageClient(this.storage_api, {
        apiKey: this.service_key,
        Authorization: "Bearer ".concat(this.service_key)
      });
    }
  }, {
    key: "getUploadStreamDescriptor",
    value: function () {
      var _getUploadStreamDescriptor = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(fileData) {
        var _this2 = this;
        var pass, chunks, fileKey, uploadPromise;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              pass = new _stream["default"].PassThrough();
              chunks = [];
              fileKey = "exports/".concat(fileData.name, "-").concat(Date.now()).concat(fileData.ext);
              console.log('Initialized upload with fileKey:', fileKey);

              // Promise to handle the complete process of buffering and uploading
              uploadPromise = new Promise( /*#__PURE__*/function () {
                var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(resolve, reject) {
                  var buffer, _yield$_this2$storage, data, error;
                  return _regenerator["default"].wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        // Collect data into a buffer
                        pass.on('data', function (chunk) {
                          chunks.push(chunk);
                          console.log('Received chunk with length:', chunk.length);
                        });
                        _context.prev = 1;
                        console.log('Waiting for all data to be passed...');
                        _context.next = 5;
                        return (0, _promises.finished)(pass);
                      case 5:
                        console.log('All data has been received.');

                        // Combine all chunks into a single buffer
                        buffer = Buffer.concat(chunks);
                        console.log('Buffer created, size:', buffer.length);

                        // Execute the upload
                        console.log('Starting upload to Supabase...');
                        _context.next = 11;
                        return _this2.storageClient().from(_this2.bucket_name).upload(fileKey, buffer, {
                          contentType: fileData.contentType
                        });
                      case 11:
                        _yield$_this2$storage = _context.sent;
                        data = _yield$_this2$storage.data;
                        error = _yield$_this2$storage.error;
                        if (error) {
                          console.error('Upload failed:', error);
                          reject(error);
                        } else {
                          console.log('Upload successful:', data.path);
                          resolve({
                            success: true,
                            path: data.path
                          });
                        }
                        _context.next = 21;
                        break;
                      case 17:
                        _context.prev = 17;
                        _context.t0 = _context["catch"](1);
                        console.error('Error during upload process:', _context.t0);
                        reject(_context.t0);
                      case 21:
                      case "end":
                        return _context.stop();
                    }
                  }, _callee, null, [[1, 17]]);
                }));
                return function (_x2, _x3) {
                  return _ref2.apply(this, arguments);
                };
              }());
              return _context2.abrupt("return", {
                writeStream: pass,
                promise: uploadPromise,
                url: "".concat(this.storage_url, "/").concat(this.bucket_name, "/").concat(fileKey),
                fileKey: fileKey
              });
            case 6:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getUploadStreamDescriptor(_x) {
        return _getUploadStreamDescriptor.apply(this, arguments);
      }
      return getUploadStreamDescriptor;
    }()
  }, {
    key: "getDownloadStream",
    value: function () {
      var _getDownloadStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(_ref3) {
        var fileKey, _ref3$isPrivate, isPrivate, _yield$this$storageCl, data, error, buffer;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              fileKey = _ref3.fileKey, _ref3$isPrivate = _ref3.isPrivate, isPrivate = _ref3$isPrivate === void 0 ? true : _ref3$isPrivate;
              _context3.next = 3;
              return this.storageClient().from(this.bucket_name).download(fileKey);
            case 3:
              _yield$this$storageCl = _context3.sent;
              data = _yield$this$storageCl.data;
              error = _yield$this$storageCl.error;
              if (!error) {
                _context3.next = 9;
                break;
              }
              console.log(error);
              throw error;
            case 9:
              _context3.prev = 9;
              _context3.t0 = Buffer;
              _context3.next = 13;
              return data.arrayBuffer();
            case 13:
              _context3.t1 = _context3.sent;
              buffer = _context3.t0.from.call(_context3.t0, _context3.t1);
              return _context3.abrupt("return", _nodeStream.Readable.from(buffer));
            case 18:
              _context3.prev = 18;
              _context3.t2 = _context3["catch"](9);
              console.log(_context3.t2);
              throw _context3.t2;
            case 22:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[9, 18]]);
      }));
      function getDownloadStream(_x4) {
        return _getDownloadStream.apply(this, arguments);
      }
      return getDownloadStream;
    }() // @ts-ignore
  }, {
    key: "upload",
    value: function () {
      var _upload = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(fileData) {
        var parsedFilename, filePath, _yield$this$storageCl2, data, error;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              parsedFilename = (0, _path.parse)(fileData.originalname);
              filePath = "".concat(parsedFilename.name, "-").concat(Date.now()).concat(parsedFilename.ext);
              _context4.next = 4;
              return this.storageClient().from(this.bucket_name).upload(filePath, (0, _fs.createReadStream)(fileData.path), {
                duplex: "half"
              });
            case 4:
              _yield$this$storageCl2 = _context4.sent;
              data = _yield$this$storageCl2.data;
              error = _yield$this$storageCl2.error;
              if (!error) {
                _context4.next = 10;
                break;
              }
              console.log(error);
              throw error;
            case 10:
              return _context4.abrupt("return", {
                url: "".concat(this.storage_url, "/").concat(this.bucket_name, "/").concat(data.path),
                key: data.path
              });
            case 11:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function upload(_x5) {
        return _upload.apply(this, arguments);
      }
      return upload;
    }() // @ts-ignore
  }, {
    key: "delete",
    value: function () {
      var _delete2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(fileData) {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return this.storageClient().from(this.bucket_name).remove([fileData.fileKey]);
            case 3:
              _context5.next = 8;
              break;
            case 5:
              _context5.prev = 5;
              _context5.t0 = _context5["catch"](0);
              throw _context5.t0;
            case 8:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[0, 5]]);
      }));
      function _delete(_x6) {
        return _delete2.apply(this, arguments);
      }
      return _delete;
    }()
  }]);
  return SupabaseService;
}(_medusaInterfaces.FileService);
var _default = exports["default"] = SupabaseService;