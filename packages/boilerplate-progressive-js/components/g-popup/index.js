Component({
  didMount() {},
  methods: {
    onPopupClose(event) {
      if (this.props.onClose) {
        this.props.onClose(event);
      }
    },
  }
});

