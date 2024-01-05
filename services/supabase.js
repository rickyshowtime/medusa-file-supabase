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
var _medusaInterfaces = require("medusa-interfaces");
var _storageJs = require("@supabase/storage-js");
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

    //Implement fix for exports error: [object Object] this.fileService_.withTransaction(...).getUploadStreamDescriptor is not a function
  }, {
    key: "getUploadStreamDescriptor",
    value: function () {
      var _getUploadStreamDescriptor = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref2) {
        var name, ext, _ref2$isPrivate, isPrivate, filePath, writeStream;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              name = _ref2.name, ext = _ref2.ext, _ref2$isPrivate = _ref2.isPrivate, isPrivate = _ref2$isPrivate === void 0 ? false : _ref2$isPrivate;
              filePath = "".concat(isPrivate ? 'protected' : 'public', "/exports/").concat(name, ".").concat(ext);
              writeStream = (0, _fs.createReadStream)(filePath);
              return _context.abrupt("return", {
                writeStream: writeStream,
                promise: Promise.resolve(),
                url: "".concat(this.storage_url, "/").concat(this.bucket_name, "/").concat(filePath),
                fileKey: filePath
              });
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function getUploadStreamDescriptor(_x) {
        return _getUploadStreamDescriptor.apply(this, arguments);
      }
      return getUploadStreamDescriptor;
    }() // @ts-ignore
  }, {
    key: "upload",
    value: function () {
      var _upload = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(file) {
        var _yield$this$storageCl, data, error;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.storageClient().from(this.bucket_name)
              // @ts-ignore
              .upload(file.path, (0, _fs.createReadStream)(file.path), {
                duplex: "half"
              });
            case 2:
              _yield$this$storageCl = _context2.sent;
              data = _yield$this$storageCl.data;
              error = _yield$this$storageCl.error;
              if (!error) {
                _context2.next = 8;
                break;
              }
              console.log(error);
              throw error;
            case 8:
              return _context2.abrupt("return", {
                url: "".concat(this.storage_url, "/").concat(this.bucket_name, "/").concat(data.path)
              });
            case 9:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function upload(_x2) {
        return _upload.apply(this, arguments);
      }
      return upload;
    }() // @ts-ignore
  }, {
    key: "delete",
    value: function () {
      var _delete2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(filepath) {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return this.storageClient().from(this.bucket_name).remove([filepath]);
            case 3:
              _context3.next = 8;
              break;
            case 5:
              _context3.prev = 5;
              _context3.t0 = _context3["catch"](0);
              throw _context3.t0;
            case 8:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[0, 5]]);
      }));
      function _delete(_x3) {
        return _delete2.apply(this, arguments);
      }
      return _delete;
    }()
  }]);
  return SupabaseService;
}(_medusaInterfaces.FileService);
var _default = exports["default"] = SupabaseService;