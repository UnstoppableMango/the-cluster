// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        (unknown)
// source: io/unmango/thecluster/v1alpha1/work.proto

package theclusterv1alpha1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Workspace struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	WorkingDirectory string `protobuf:"bytes,1,opt,name=working_directory,json=workingDirectory,proto3" json:"working_directory,omitempty"`
}

func (x *Workspace) Reset() {
	*x = Workspace{}
	if protoimpl.UnsafeEnabled {
		mi := &file_io_unmango_thecluster_v1alpha1_work_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Workspace) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Workspace) ProtoMessage() {}

func (x *Workspace) ProtoReflect() protoreflect.Message {
	mi := &file_io_unmango_thecluster_v1alpha1_work_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Workspace.ProtoReflect.Descriptor instead.
func (*Workspace) Descriptor() ([]byte, []int) {
	return file_io_unmango_thecluster_v1alpha1_work_proto_rawDescGZIP(), []int{0}
}

func (x *Workspace) GetWorkingDirectory() string {
	if x != nil {
		return x.WorkingDirectory
	}
	return ""
}

var File_io_unmango_thecluster_v1alpha1_work_proto protoreflect.FileDescriptor

var file_io_unmango_thecluster_v1alpha1_work_proto_rawDesc = []byte{
	0x0a, 0x29, 0x69, 0x6f, 0x2f, 0x75, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x2f, 0x74, 0x68, 0x65,
	0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x2f, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x31,
	0x2f, 0x77, 0x6f, 0x72, 0x6b, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x1e, 0x69, 0x6f, 0x2e,
	0x75, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x2e, 0x74, 0x68, 0x65, 0x63, 0x6c, 0x75, 0x73, 0x74,
	0x65, 0x72, 0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x31, 0x22, 0x38, 0x0a, 0x09, 0x57,
	0x6f, 0x72, 0x6b, 0x73, 0x70, 0x61, 0x63, 0x65, 0x12, 0x2b, 0x0a, 0x11, 0x77, 0x6f, 0x72, 0x6b,
	0x69, 0x6e, 0x67, 0x5f, 0x64, 0x69, 0x72, 0x65, 0x63, 0x74, 0x6f, 0x72, 0x79, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x10, 0x77, 0x6f, 0x72, 0x6b, 0x69, 0x6e, 0x67, 0x44, 0x69, 0x72, 0x65,
	0x63, 0x74, 0x6f, 0x72, 0x79, 0x42, 0xa9, 0x02, 0x0a, 0x22, 0x63, 0x6f, 0x6d, 0x2e, 0x69, 0x6f,
	0x2e, 0x75, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x2e, 0x74, 0x68, 0x65, 0x63, 0x6c, 0x75, 0x73,
	0x74, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x31, 0x42, 0x09, 0x57, 0x6f,
	0x72, 0x6b, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x50, 0x01, 0x5a, 0x5d, 0x67, 0x69, 0x74, 0x68, 0x75,
	0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x75, 0x6e, 0x73, 0x74, 0x6f, 0x70, 0x70, 0x61, 0x62, 0x6c,
	0x65, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x2f, 0x74, 0x68, 0x65, 0x2d, 0x63, 0x6c, 0x75, 0x73, 0x74,
	0x65, 0x72, 0x2f, 0x67, 0x65, 0x6e, 0x2f, 0x69, 0x6f, 0x2f, 0x75, 0x6e, 0x6d, 0x61, 0x6e, 0x67,
	0x6f, 0x2f, 0x74, 0x68, 0x65, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x2f, 0x76, 0x31, 0x61,
	0x6c, 0x70, 0x68, 0x61, 0x31, 0x3b, 0x74, 0x68, 0x65, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72,
	0x76, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x31, 0xa2, 0x02, 0x03, 0x49, 0x55, 0x54, 0xaa, 0x02,
	0x1e, 0x49, 0x6f, 0x2e, 0x55, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x2e, 0x54, 0x68, 0x65, 0x63,
	0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x2e, 0x56, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x31, 0xca,
	0x02, 0x1e, 0x49, 0x6f, 0x5c, 0x55, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x5c, 0x54, 0x68, 0x65,
	0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x5c, 0x56, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x31,
	0xe2, 0x02, 0x2a, 0x49, 0x6f, 0x5c, 0x55, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x5c, 0x54, 0x68,
	0x65, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x5c, 0x56, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61,
	0x31, 0x5c, 0x47, 0x50, 0x42, 0x4d, 0x65, 0x74, 0x61, 0x64, 0x61, 0x74, 0x61, 0xea, 0x02, 0x21,
	0x49, 0x6f, 0x3a, 0x3a, 0x55, 0x6e, 0x6d, 0x61, 0x6e, 0x67, 0x6f, 0x3a, 0x3a, 0x54, 0x68, 0x65,
	0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x3a, 0x3a, 0x56, 0x31, 0x61, 0x6c, 0x70, 0x68, 0x61,
	0x31, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_io_unmango_thecluster_v1alpha1_work_proto_rawDescOnce sync.Once
	file_io_unmango_thecluster_v1alpha1_work_proto_rawDescData = file_io_unmango_thecluster_v1alpha1_work_proto_rawDesc
)

func file_io_unmango_thecluster_v1alpha1_work_proto_rawDescGZIP() []byte {
	file_io_unmango_thecluster_v1alpha1_work_proto_rawDescOnce.Do(func() {
		file_io_unmango_thecluster_v1alpha1_work_proto_rawDescData = protoimpl.X.CompressGZIP(file_io_unmango_thecluster_v1alpha1_work_proto_rawDescData)
	})
	return file_io_unmango_thecluster_v1alpha1_work_proto_rawDescData
}

var file_io_unmango_thecluster_v1alpha1_work_proto_msgTypes = make([]protoimpl.MessageInfo, 1)
var file_io_unmango_thecluster_v1alpha1_work_proto_goTypes = []any{
	(*Workspace)(nil), // 0: io.unmango.thecluster.v1alpha1.Workspace
}
var file_io_unmango_thecluster_v1alpha1_work_proto_depIdxs = []int32{
	0, // [0:0] is the sub-list for method output_type
	0, // [0:0] is the sub-list for method input_type
	0, // [0:0] is the sub-list for extension type_name
	0, // [0:0] is the sub-list for extension extendee
	0, // [0:0] is the sub-list for field type_name
}

func init() { file_io_unmango_thecluster_v1alpha1_work_proto_init() }
func file_io_unmango_thecluster_v1alpha1_work_proto_init() {
	if File_io_unmango_thecluster_v1alpha1_work_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_io_unmango_thecluster_v1alpha1_work_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*Workspace); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_io_unmango_thecluster_v1alpha1_work_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   1,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_io_unmango_thecluster_v1alpha1_work_proto_goTypes,
		DependencyIndexes: file_io_unmango_thecluster_v1alpha1_work_proto_depIdxs,
		MessageInfos:      file_io_unmango_thecluster_v1alpha1_work_proto_msgTypes,
	}.Build()
	File_io_unmango_thecluster_v1alpha1_work_proto = out.File
	file_io_unmango_thecluster_v1alpha1_work_proto_rawDesc = nil
	file_io_unmango_thecluster_v1alpha1_work_proto_goTypes = nil
	file_io_unmango_thecluster_v1alpha1_work_proto_depIdxs = nil
}