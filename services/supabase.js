"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _fs = _interopRequireWildcard(require("fs"));
var fs = _fs;
var _storageJs = require("@supabase/storage-js");
var _medusa = require("@medusajs/medusa");
var _nodeStream = require("node:stream");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var SupabaseService = /*#__PURE__*/function (_AbstractFileService) {
  (0, _inherits2["default"])(SupabaseService, _AbstractFileService);
  var _super = _createSuper(SupabaseService);
  function SupabaseService(container, options) {
    var _this;
    (0, _classCallCheck2["default"])(this, SupabaseService);
    _this = _super.call(this, container);
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

    //Implement fix for exports error: [object Object] this.fileService_.withTransaction(...).getUploadStreamDescriptor is not a function
  }, {
    key: "getUploadStreamDescriptor",
    value: function () {
      var _getUploadStreamDescriptor = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(fileData) {
        var filePath, fileName, writeStream, _yield$this$storageCl, data, error;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              filePath = "".concat(fileData.isPrivate ? 'protected' : 'public', "/exports/");
              fileName = "".concat(fileData.name, ".").concat(fileData.ext);
              writeStream = fs.createWriteStream(filePath);
              _context.next = 5;
              return this.storageClient().from(this.bucket_name).upload(filePath, (0, _fs.createReadStream)(fileName), {
                duplex: "half"
              });
            case 5:
              _yield$this$storageCl = _context.sent;
              data = _yield$this$storageCl.data;
              error = _yield$this$storageCl.error;
              if (!error) {
                _context.next = 11;
                break;
              }
              console.log(error);
              throw error;
            case 11:
              return _context.abrupt("return", {
                // @ts-ignore
                writeStream: writeStream,
                promise: Promise.resolve(),
                url: "".concat(this.storage_url, "/").concat(this.bucket_name, "/").concat(data.path),
                fileKey: data.path
              });
            case 12:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function getUploadStreamDescriptor(_x) {
        return _getUploadStreamDescriptor.apply(this, arguments);
      }
      return getUploadStreamDescriptor;
    }()
  }, {
    key: "getDownloadStream",
    value: function () {
      var _getDownloadStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref) {
        var fileKey, _ref$isPrivate, isPrivate, _yield$this$storageCl2, data, error, buffer;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              fileKey = _ref.fileKey, _ref$isPrivate = _ref.isPrivate, isPrivate = _ref$isPrivate === void 0 ? true : _ref$isPrivate;
              _context2.next = 3;
              return this.storageClient().from(this.bucket_name).download(fileKey);
            case 3:
              _yield$this$storageCl2 = _context2.sent;
              data = _yield$this$storageCl2.data;
              error = _yield$this$storageCl2.error;
              if (!error) {
                _context2.next = 9;
                break;
              }
              console.log(error);
              throw error;
            case 9:
              _context2.prev = 9;
              _context2.t0 = Buffer;
              _context2.next = 13;
              return data.arrayBuffer();
            case 13:
              _context2.t1 = _context2.sent;
              buffer = _context2.t0.from.call(_context2.t0, _context2.t1);
              return _context2.abrupt("return", _nodeStream.Readable.from(buffer));
            case 18:
              _context2.prev = 18;
              _context2.t2 = _context2["catch"](9);
              console.log(_context2.t2);
              throw _context2.t2;
            case 22:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[9, 18]]);
      }));
      function getDownloadStream(_x2) {
        return _getDownloadStream.apply(this, arguments);
      }
      return getDownloadStream;
    }() // @ts-ignore
  }, {
    key: "upload",
    value: function () {
      var _upload = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(fileData) {
        var _yield$this$storageCl3, data, error;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.storageClient().from(this.bucket_name).upload(fileData.path, (0, _fs.createReadStream)(fileData.originalname), {
                duplex: "half"
              });
            case 2:
              _yield$this$storageCl3 = _context3.sent;
              data = _yield$this$storageCl3.data;
              error = _yield$this$storageCl3.error;
              if (!error) {
                _context3.next = 8;
                break;
              }
              console.log(error);
              throw error;
            case 8:
              return _context3.abrupt("return", {
                url: "".concat(this.storage_url, "/").concat(this.bucket_name, "/").concat(data.path),
                key: data.path
              });
            case 9:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function upload(_x3) {
        return _upload.apply(this, arguments);
      }
      return upload;
    }() // @ts-ignore
  }, {
    key: "delete",
    value: function () {
      var _delete2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(fileData) {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return this.storageClient().from(this.bucket_name).remove([fileData.fileKey]);
            case 3:
              _context4.next = 8;
              break;
            case 5:
              _context4.prev = 5;
              _context4.t0 = _context4["catch"](0);
              throw _context4.t0;
            case 8:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[0, 5]]);
      }));
      function _delete(_x4) {
        return _delete2.apply(this, arguments);
      }
      return _delete;
    }()
  }]);
  return SupabaseService;
}(_medusa.AbstractFileService);
var _default = exports["default"] = SupabaseService;